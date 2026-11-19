import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type ServiceDocumentDataSlicesSlice = never

/**
 * Item in *Service → Key Highlights / Features*
 */
export interface ServiceDocumentDataHighlightsItem {
	/**
	 * Highlight Feature field in *Service → Key Highlights / Features*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. 60-min complimentary airport wait
	 * - **API ID Path**: service.highlights[].highlight_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	highlight_text: prismic.KeyTextField;
}

/**
 * Content for Service documents
 */
interface ServiceDocumentData {
	/**
	 * Slice Zone field in *Service*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<ServiceDocumentDataSlicesSlice>;
	
	/**
	 * Service Title field in *Service*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Tagline or Badge field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. Airport Transfer or Most Popular
	 * - **API ID Path**: service.tagline
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tagline: prismic.KeyTextField;
	
	/**
	 * Short Description field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Brief overview shown on cards
	 * - **API ID Path**: service.short_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	short_description: prismic.KeyTextField;
	
	/**
	 * Hero Description field in *Service*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Detailed overview on the service page
	 * - **API ID Path**: service.hero_description
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	hero_description: prismic.RichTextField;
	
	/**
	 * Featured Image field in *Service*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.featured_image
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	featured_image: prismic.ImageField<never>;
	
	/**
	 * Icon Key field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. plane, car, clock, building
	 * - **API ID Path**: service.icon_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icon_name: prismic.KeyTextField;
	
	/**
	 * Starting Price Note field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. From  SGD
	 * - **API ID Path**: service.starting_price
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	starting_price: prismic.KeyTextField;
	
	/**
	 * Display Order field in *Service*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: 1, 2, 3...
	 * - **API ID Path**: service.display_order
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	display_order: prismic.NumberField;
	
	/**
	 * Featured on Home Page (Top 4) field in *Service*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.is_featured
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	is_featured: prismic.BooleanField;
	
	/**
	 * Key Highlights / Features field in *Service*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.highlights[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	highlights: prismic.GroupField<Simplify<ServiceDocumentDataHighlightsItem>>;/**
	 * Meta Title field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: service.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Service*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: service.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Service*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: service.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Service document from Prismic
 *
 * - **API ID**: `service`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ServiceDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<ServiceDocumentData>, "service", Lang>;

export type AllDocumentTypes = ServiceDocument;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			ServiceDocument,
			ServiceDocumentData,
			ServiceDocumentDataSlicesSlice,
			ServiceDocumentDataHighlightsItem,
			AllDocumentTypes
		}
	}
}