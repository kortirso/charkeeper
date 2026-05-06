# frozen_string_literal: true

module CosmereContext
  class TalentsTree
    include Deps[markdown: 'markdown']
    include TranslateHelper

    def call(selected_feat_slugs:) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
      @selected_feat_slugs = selected_feat_slugs
      {
        ancestry: {
          singer: feat_info('change_form')
        }.compact,
        heroic: {
          agent: feat_info('opportunist'),
          envoy: feat_info('rousing_presence'),
          hunter: feat_info('seek_quarry'),
          leader: feat_info('decisive_command'),
          scholar: feat_info('erudition'),
          warrior: feat_info('vigilant_stance')
        }.compact,
        radiant: {
          dustbringer: feat_info('first_ideal_dustbringer'),
          edgedancer: feat_info('first_ideal_edgedancer'),
          elsecaller: feat_info('first_ideal_elsecaller'),
          lightweaver: feat_info('first_ideal_lightweaver'),
          skybreaker: feat_info('first_ideal_skybreaker'),
          stoneward: feat_info('first_ideal_stoneward'),
          truthwatcher: feat_info('first_ideal_truthwatcher'),
          willshaper: feat_info('first_ideal_willshaper'),
          windrunner: feat_info('first_ideal_windrunner')
        }.compact,
        surge: {
          abrasion: feat_info('abrasion_surge'),
          adhesion: feat_info('adhesion_surge'),
          cohesion: feat_info('cohesion_surge'),
          division: feat_info('division_surge'),
          gravitation: feat_info('gravitation_surge'),
          illumination: feat_info('illumination_surge'),
          progression: feat_info('progression_surge'),
          tension: feat_info('tension_surge'),
          transformation: feat_info('transformation_surge'),
          transportation: feat_info('transportation_surge')
        }.compact
      }.compact
    end

    private

    def feat_info(slug) # rubocop: disable Metrics/AbcSize
      feat = feats[slug]
      return unless feat
      # если для доступа необходимо несколько талантов
      return if feat.dig(:info, 'required')&.any? { |item| !selected?(feat, item) }

      selected = selected?(feat, slug)
      payload = {
        id: feat[:id],
        slug: feat[:slug],
        title: translate(feat[:title]),
        description: markdown.call(value: translate(feat[:description]), version: '0.4.31'),
        selected: selected
      }
      if selected && feat.dig(:info, 'required_for')
        payload[:feats] = feat.dig(:info, 'required_for').filter_map { |item| feat_info(item) }
      end
      payload
    end

    def selected?(feat, slug)
      return true if @selected_feat_slugs[slug] # просто выбран

      selected_double_slugs.include?(feat.dig(:info, 'double_slug')) # выбран дубль
    end

    def selected_double_slugs
      @selected_double_slugs ||= @selected_feat_slugs.values.filter_map { |item| item['double_slug'] }.flatten
    end

    def feats
      @feats ||=
        Cosmere::Feat.hashable_pluck(:id, :slug, :title, :description, :origin_value, :info)
          .index_by { |item| item[:slug] }
    end
  end
end
