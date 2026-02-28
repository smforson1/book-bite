import 'react-native';

declare module 'react-native' {
    interface FlatListProps<ItemT> {
        refreshControl?: any;
        contentContainerStyle?: any;
        pagingEnabled?: boolean;
        showsHorizontalScrollIndicator?: boolean;
        showsVerticalScrollIndicator?: boolean;
        ListEmptyComponent?: any;
        onScroll?: (event: any) => void;
        scrollEventThrottle?: number;
        bounces?: boolean;
        numColumns?: number;
        columnWrapperStyle?: any;
    }
}
