# frozen_string_literal: true

module CosmereContext
  class TalentsTree
    include Deps[markdown: 'markdown']
    include TranslateHelper

    def call(selected_feat_slugs:)
      @selected_feat_slugs = selected_feat_slugs
      {
        heroic: {
          agent: feat_info('opportunist'),
          envoy: feat_info('rousing_presence'),
          hunter: feat_info('seek_quarry'),
          leader: feat_info('decisive_command'),
          scholar: feat_info('erudition'),
          warrior: feat_info('vigilant_stance')
        }
      }
    end

    private

    def feat_info(slug)
      feat = feats[slug]
      payload = {
        id: feat[:id],
        slug: feat[:slug],
        title: translate(feat[:title]),
        description: markdown.call(value: translate(feat[:description]), version: '0.4.31'),
        selected: @selected_feat_slugs.include?(slug)
      }
      if @selected_feat_slugs.include?(slug) && feat.dig(:info, 'required_for')
        payload[:feats] = feat.dig(:info, 'required_for').map { |item| feat_info(item) }
      end
      payload
    end

    def feats
      @feats ||=
        Cosmere::Feat.hashable_pluck(:id, :slug, :title, :description, :origin_value, :info)
          .index_by { |item| item[:slug] }
    end
  end
end
