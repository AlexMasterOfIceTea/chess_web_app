import { Game } from '../components/Game'
import Layout from '../components/Layout'

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1 className='text-red-500 text-xl text-center'>Play chess online</h1>
    <Game />
  </Layout>
)

export default IndexPage
