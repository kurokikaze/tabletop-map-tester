type WarningProps = {
  bright: boolean
}
export default function Warning({ bright = true }: WarningProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" fill={bright ? 'yellow' : 'black'} viewBox="0 0 491.537 491.537" width={20} height={20} xmlSpace="preserve"><path d="m488.117 459.466-223.1-447.2c-10.4-17.4-32-13.1-37.5 0l-225.2 449.3c-8 15.6 6.3 29.2 18.8 29.2H471.517c16 0 25.5-18.3 16.6-31.3zm-433.7-9.4 191.8-383.6 190.8 383.7h-382.6v-.1z"/><path d="M225.417 206.166v104.3c0 11.5 9.4 20.9 20.9 20.9 11.5 0 19.8-8.3 20.9-19.8v-105.4c0-11.5-9.4-20.9-20.9-20.9-11.5 0-20.9 9.4-20.9 20.9z"/><circle cx="246.217" cy="388.066" r="20.5"/></svg>
}