import { redirect, type LoaderArgs } from '@shopify/remix-oxygen'

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 * @param ?redirect an optional path to return to otherwise return to the home page
 * @example
 * Example path applying a discount and redirecting
 * ```ts
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 * @preserve
 */
export async function loader({ request, context, params }: LoaderArgs) {
  const { cart } = context
  const { code } = params

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const redirectParam =
    searchParams.get('redirect') || searchParams.get('return_to') || '/'

  searchParams.delete('redirect')
  searchParams.delete('return_to')

  const redirectUrl = `${redirectParam}?${searchParams}`

  if (!code) {
    return redirect(redirectUrl)
  }

  const result = await cart.updateDiscountCodes([code])
  const headers = cart.setCartId(result.cart.id)

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  })
}
