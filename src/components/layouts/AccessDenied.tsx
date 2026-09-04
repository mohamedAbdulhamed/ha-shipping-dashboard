import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme 
} from '@mui/material';
import { 
  Close,
  Security,
  ArrowBack,
  LockPerson,
  Warning 
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { ROUTES } from '@/app/routes/routesConfig';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

interface AccessDeniedProps {
  location?: {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  };
  requiredRoles?: string[];
  requiredPermissions?: string[];
  onRequestAccess?: () => void;
}

export const AccessDenied: FC<AccessDeniedProps> = ({
  location,
  requiredRoles = [],
  requiredPermissions = [],
  onRequestAccess,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: theme.palette.mode === 'dark' 
          ? 'radial-gradient(circle at center, #1a1a1a, #000)' 
          : 'radial-gradient(circle at center, #f8f9fa, #e9ecef)',
      }}
    >
      <Card
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          boxShadow: theme.shadows[10],
          position: 'relative',
          border: `2px solid ${theme.palette.error.main}`,
          borderRadius: 4,
        }}
      >
        <IconButton
          sx={{ position: 'absolute', top: 16, right: 16 }}
          onClick={() => navigate(ROUTES.HOME.url)}
        >
          <Close />
        </IconButton>

        <Stack spacing={3} alignItems="center">
          <Warning
            sx={{
              fontSize: 80,
              color: theme.palette.error.main,
              animation: `${float} 3s ease-in-out infinite`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />

          <Typography variant="h3" fontWeight="bold" textAlign="center">
            Access Restricted
          </Typography>

          <Typography variant="body1" color="text.secondary" textAlign="center">
            You don't have permission to access this resource. Contact your
            system administrator if you believe this is an error.
          </Typography>

          <Divider sx={{ width: '100%', borderColor: 'divider' }} />

          <Stack spacing={2} width="100%">
            {location && (
              <Stack direction="row" spacing={1} alignItems="center">
                <LockPerson color="error" />
                <Typography variant="body2">
                  Attempted access to:{' '}
                  <Box component="span" fontWeight="bold">
                    {location.pathname}
                  </Box>
                </Typography>
              </Stack>
            )}

            {(requiredRoles.length > 0 || requiredPermissions.length > 0) && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Required Access Level:
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {requiredRoles.map(role => (
                    <Chip
                      key={role}
                      label={role}
                      color="error"
                      variant="outlined"
                      icon={<Security />}
                    />
                  ))}
                  {requiredPermissions.map(permission => (
                    <Chip
                      key={permission}
                      label={permission}
                      color="error"
                      variant="outlined"
                      icon={<Security />}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={2} width="100%">
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 2 }}
            >
              Go Back
            </Button>

            {onRequestAccess && (
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={onRequestAccess}
                sx={{ borderRadius: 2 }}
              >
                Request Access
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};