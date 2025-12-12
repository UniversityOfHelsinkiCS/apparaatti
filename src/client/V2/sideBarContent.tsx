import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const SidebarContent = ()=> {
  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Opetettu kieli</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {['Suomi', 'Ruotsi', 'Englanti'].map((lang) => (
              <ListItem button key={lang}>
                <ListItemText primary={lang} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Suoritustapa</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Essee, tentti, projekti...</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Valmentava kurssi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Valmistaa jatko-opintoihin</Typography>
        </AccordionDetails>
      </Accordion>

      {/* Add more sections as needed */}
    </>
  )
}


export default SidebarContent

