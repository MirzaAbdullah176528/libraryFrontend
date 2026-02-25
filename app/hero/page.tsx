import { Box , Typography , Button } from "@mui/material"

const Hero = () =>{
    return(
        <Box>
            <Box sx={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                width:'100%',
                maxWidth:'1500px',
                backgroundImage: 'url("/hero-light.webp")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                maxheigth:'120vw',
                minHeight:'80vh',
                // position:'absolute',
                // left:0,
                // top:0
            }}>
                <Typography></Typography>
                <Typography></Typography>
                <Button></Button>
            </Box>
        </Box>
    )
}

export default Hero