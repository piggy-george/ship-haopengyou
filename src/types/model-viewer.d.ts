declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      'auto-rotate'?: boolean;
      'camera-controls'?: boolean;
      'shadow-intensity'?: string;
      ar?: boolean;
      'ar-modes'?: string;
      loading?: string;
      reveal?: string;
      exposure?: string;
      'shadow-softness'?: string;
      style?: React.CSSProperties;
      ref?: React.Ref<any>;
    };
  }
}
