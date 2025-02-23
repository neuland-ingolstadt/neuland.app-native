import React from 'react';

const DragDropView = ({
	children
}: {
	children: React.ReactNode;
}): React.ReactElement => {
	return React.createElement(React.Fragment, null, children);
};

export default DragDropView;
