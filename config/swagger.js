import swaggerJSDoc from "swagger-jsdoc";
import dotenv from 'dotenv';
dotenv.config();

const swaggerDefinition={
    openapi:"3.0.0",
    info:{
        title:"Courier Delivery API",
        version:"1.0.0",
        description:"API documentation for the Courier Delivery Web Application",
    },
    servers:[
        {
            url:"http://localhost:"+ (process.env.PORT || 5030),
            description:"Development Server",
        }
    ],
    components:{
        securitySchema:{
            bearerAuth:{
                type:"http",
                schema:"bearer",
                bearerFormat:"JWT"
            }
        }
    },
    security:[
        {
            bearerAuth:[]
        }
    ]
}

const options={
    swaggerDefinition,
    apis:['./routes/*.js'], //Path to the API docs
}

const swaggerSpec=swaggerJSDoc(options);
export default swaggerSpec;