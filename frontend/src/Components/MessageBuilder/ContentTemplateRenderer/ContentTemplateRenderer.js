import React from 'react';
import Box from '@mui/material/Box';
import { Card, CardContent, Typography, Button, CardMedia, CardActions } from '@mui/material';
import TemplateVariablesInput from './TemplateVariablesInput';

const ContentTemplateRenderer = ({ template }) => {

  const renderCard = () => {

    const { actions, media, title, subtitle } = template.content['twilio/card'] ;
    return (
      <Box mb={2}>
      <Card>
      {media[0] && (
        <CardMedia
          component="img"
          alt="Image"
          image={media[0]}
          style={{ objectFit: 'cover', maxWidth: '100%' }}
        />
      )}
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
      {actions && actions.length > 0 && (
        <CardActions style={{ justifyContent: 'center' }}>
          {actions.map((button, index) => (
            <Button key={index} size="large" color="primary">
              {button.title}
            </Button>
          ))}
        </CardActions>
      )}
    </Card>
    </Box>
    );
  }

  const renderText = () => {
    const { body } = template.content['twilio/text']
    return (
      <Box mb={2}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {body}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )

  }

  const renderButtons = (type) => {

    const { actions, body } = template.content[type] ;
    return (
      <Box mb={2}>
      <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </CardContent>
      {actions && actions.length > 0 && (
        <CardActions style={{ justifyContent: 'center' }}>
          {actions.map((button, index) => (
            <Button key={index} size="large" color="primary">
              {button.title}
            </Button>
          ))}
        </CardActions>
      )}
    </Card>
    </Box>
    );
  }

  const renderList = () => {

    const { button, body } = template.content['twilio/list-picker'] ;
    return (
      <Box mb={2}>
      <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'center' }}>
          <Button key="list-button" size="large" color="primary">
            {button}
          </Button>
      </CardActions>

    </Card>
    </Box>
    );
  }

  const renderMedia = () => {
    const { body, media } = template.content['twilio/media']
    return (
      <Box mb={2}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {body}
            </Typography>      
          </CardContent>
          <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
              Media URL: {media}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )

  }

  const renderContent = () => {
    if ('twilio/card' in template.content) return (<>{renderCard("card")}</>);    
    else if ('twilio/call-to-action' in template.content) return (<>{renderButtons("twilio/call-to-action")}</>);    
    else if ('twilio/quick-reply' in template.content) return (<>{renderButtons("twilio/quick-reply")}</>);  
    else if ('twilio/list-picker' in template.content) return (<>{renderList()}</>);  
    else if ('twilio/text' in template.content)return (<>{renderText()}</>);    
    else if ('twilio/media' in template.content)return (<>{renderMedia()}</>);
  };

  return (
    <Box mt={2}>
      {renderContent()}
      {Object.keys(template.variables).length > 0 && <TemplateVariablesInput data={template.variables} />}
    </Box>
  );
}

export default ContentTemplateRenderer;
