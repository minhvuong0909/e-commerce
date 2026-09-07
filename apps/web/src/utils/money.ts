const money = (n: number) => {
  const amount = Number(n)
  return `${(Number.isFinite(amount) ? amount : 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ`
}
export default money
