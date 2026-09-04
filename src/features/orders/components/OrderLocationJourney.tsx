import { Box, Paper, Typography, Stack, Avatar, useTheme, alpha, Chip } from "@mui/material";
import StoreIcon from '@mui/icons-material/Store';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface OrderLocationJourneyProps {
  order: {
    senderName: string;
    senderGovernorate: string;
    senderCity: string;
    senderAddress: string;
    receiverName: string;
    receiverGovernorate: string;
    receiverCity: string;
    receiverAddress: string;
  };
}

export const OrderLocationJourney = ({ order }: OrderLocationJourneyProps) => {
  const theme = useTheme();
  
  const LocationCard = ({ 
    type, 
    name, 
    governorate, 
    city, 
    address,
    icon 
  }: { 
    type: 'sender' | 'receiver',
    name: string,
    governorate: string,
    city: string,
    address: string,
    icon: React.ReactNode
  }) => (
    <Box 
      sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        zIndex: 2,
        maxWidth: '300px'
      }}
    >
      <Avatar
        sx={{
          width: 64,
          height: 64,
          bgcolor: type === 'sender' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.success.main, 0.1),
          color: type === 'sender' ? theme.palette.primary.main : theme.palette.success.main,
          boxShadow: `0 8px 16px ${alpha(type === 'sender' ? theme.palette.primary.main : theme.palette.success.main, 0.15)}`,
          border: `2px solid ${type === 'sender' ? theme.palette.primary.main : theme.palette.success.main}`
        }}
      >
        {icon}
      </Avatar>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {type === 'sender' ? 'الراسل' : 'المرسل إليه'}
        </Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
          {name}
        </Typography>
        <Chip 
          label={`${governorate} - ${city}`} 
          size="small" 
          color={type === 'sender' ? 'primary' : 'success'} 
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5} sx={{ opacity: 0.8 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {address}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.grey[50], 1)} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.shadows[2]
      }}
    >
      {/* Background Decorative Elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
          opacity: 0.8
        }}
      />

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        alignItems="center" 
        justifyContent="space-between" 
        gap={{ xs: 4, md: 2 }}
        sx={{ position: 'relative' }}
      >
        <LocationCard
          type="sender"
          name={order.senderName}
          governorate={order.senderGovernorate}
          city={order.senderCity}
          address={order.senderAddress}
          icon={<StoreIcon fontSize="large" />}
        />

        {/* Connector Line */}
        <Box 
          sx={{ 
            flex: 1, 
            height: { xs: '60px', md: '2px' }, 
            width: { xs: '2px', md: '100%' }, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Dashed Line */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              borderTop: `2px dashed ${theme.palette.divider}`,
              display: { xs: 'none', md: 'block' }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '2px',
              borderLeft: `2px dashed ${theme.palette.divider}`,
              display: { xs: 'block', md: 'none' }
            }}
          />

          {/* Moving Truck Icon */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 1,
              width: "30px",
              height: "30px",
              borderRadius: '50%',
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: `1px solid ${theme.palette.divider}`,
              zIndex: 1,
              color: theme.palette.text.secondary
            }}
          >
            <LocalShippingIcon sx={{ transform: 'scaleX(-1)' }} />
          </Box>
        </Box>

        <LocationCard
          type="receiver"
          name={order.receiverName}
          governorate={order.receiverGovernorate}
          city={order.receiverCity}
          address={order.receiverAddress}
          icon={<PersonPinIcon fontSize="large" />}
        />
      </Stack>
    </Paper>
  );
};
