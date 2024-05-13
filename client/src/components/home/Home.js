import RegForm from './RegForm'

const Home = () => {
    return(
        <div className='homepage-container'>
            <div className='image-container'>
                <img src='homepage.png' alt='parent reading with child'/>
            </div>
            <RegForm />
        </div>
    )
}

export default Home