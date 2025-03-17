import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AuroraImageViewerProps {
    imageUrl?: string;
    title?: string;
    open: boolean;
    onClose: () => void;
}

export const AuroraImageViewer: React.FC<AuroraImageViewerProps> = ({
    imageUrl,
    title,
    open,
    onClose
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {title}
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {imageUrl && <img src={imageUrl} alt={title} style={{ width: '100%' }} />}
            </DialogContent>
        </Dialog>
    );
}; 