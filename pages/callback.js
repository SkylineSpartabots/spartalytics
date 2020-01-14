import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import fetch from 'isomorphic-unfetch'
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Router from 'next/router';

const styles = theme => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }
  });
class Callback extends React.Component{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        //If user pressed 'back' in Discord Oauth panel
        if (!this.props.error){
            //Oauth code is valid
            const code = this.props.code
            const res = fetch('/api/callbacks', {method: 'POST',headers: new Headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({code})}).then(res => res.json().then(json => {
            console.log(json)
            window.open('/dashboard',"_self")}
        ));}else{
            Router.push('/');
        }
    }
    render(){
        const { classes } = this.props;
        return (
            <Container component="main" maxWidth="xs">
                <div className={classes.paper}>    
                <Typography component="h1" variant="h5">
                We are logging you in.
                </Typography>
                <br/>         
                <CircularProgress />       
                </div>
            </Container>    
            )
    }
}

Callback.propTypes = {
    classes: PropTypes.object.isRequired,
  };

Callback.getInitialProps = async function(query){
    const code = query.query.code;
    const error = query.query.error
    return {code: code, error: error}
}

export default withStyles(styles)(Callback);