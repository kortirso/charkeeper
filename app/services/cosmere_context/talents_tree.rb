# frozen_string_literal: true

module CosmereContext
  class TalentsTree
    include Deps[markdown: 'markdown']
    include TranslateHelper

    def call(selected_feat_slugs:, selected_feat_ids:, character:)
      @selected_feat_slugs = selected_feat_slugs
      @selected_feat_ids = selected_feat_ids
      @character = character
      {
        ancestry: ancestry_tree,
        paths: path_tree,
        invested_paths: invested_paths_tree,
        invested_arts: invested_arts_tree
      }.compact_blank
    end

    private

    def ancestry_tree
      case @character.data.ancestry
      when 'singer' then { feats: feat_info('change_form', name: 'Singer') }
      when 'human' then nil
      else
        ancestry = ::Cosmere::Homebrews::Ancestry.find_by(id: @character.data.ancestry)
        {
          feats: feat_info(::Cosmere::Feat.find_by(id: ancestry.info.key_talent).id),
          name: translate(ancestry.title)
        }
      end
    end

    def path_tree
      [
        %w[agent opportunist], %w[envoy rousing_presence], %w[hunter seek_quarry], %w[leader decisive_command],
        %w[scholar erudition], %w[warrior vigilant_stance]
      ].map do |item|
        required_for = homebrews.dig('cosmere', 'specializations').filter_map { |_, values|
          values['origin_class'] == item[0] && values['initial_talents']
        }.flatten
        {
          feats: [feat_info(item[1], required_for)],
          name: translate(::Cosmere::Character.paths_info(item[0])['name'])
        }
      end
    end

    def invested_paths_tree
      homebrews.dig('cosmere', 'invested_paths').values.map do |value|
        {
          feats: value['initial_talents'].map { |item| feat_info(item) },
          name: translate(value['name']),
          only: value['only']
        }
      end +
        [
          %w[dustbringer first_ideal_dustbringer], %w[edgedancer first_ideal_edgedancer], %w[elsecaller first_ideal_elsecaller],
          %w[lightweaver first_ideal_lightweaver], %w[skybreaker first_ideal_skybreaker], %w[stoneward first_ideal_stoneward],
          %w[truthwatcher first_ideal_truthwatcher], %w[willshaper first_ideal_willshaper], %w[windrunner first_ideal_windrunner]
        ].map do |item|
          {
            feats: [feat_info(item[1])],
            name: translate(::Config.data('cosmere', 'radiant_paths').dig(item[0], 'name')),
            only: ['roshar']
          }
        end
    end

    def invested_arts_tree
      homebrews.dig('cosmere', 'invested_arts').values.map do |value|
        {
          feats: value['initial_talents'].map { |item| feat_info(item) },
          name: translate(value['name']),
          only: value['only']
        }
      end +
        [
          %w[abrasion abrasion_surge], %w[adhesion adhesion_surge], %w[cohesion cohesion_surge],
          %w[progression progression_surge], %w[tension tension_surge], %w[transformation transformation_surge],
          %w[division division_surge], %w[gravitation gravitation_surge], %w[illumination illumination_surge],
          %w[transportation transportation_surge]
        ].map do |item|
          {
            feats: [feat_info(item[1])],
            name: translate(::Config.data('cosmere', 'surges').dig(item[0], 'name')),
            only: ['roshar']
          }
        end
    end

    def feat_info(slug_or_id, required_for=[]) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
      return unless slug_or_id

      feat = feats[slug_or_id] || feats_by_id[slug_or_id]
      return unless feat
      # если для доступа необходимо несколько талантов
      return if feat.dig(:info, 'required')&.any? { |item| !selected?(feat, item) }

      selected = selected?(feat, slug_or_id) || selected_by_id?(feat, slug_or_id)
      payload = {
        id: feat[:id],
        slug: feat[:slug],
        title: translate(feat[:title]),
        description: find_description(feat),
        selected: selected
      }
      if selected
        required_for += feat.dig(:info, 'required_for') || []
        payload[:feats] = required_for.filter_map { |item| feat_info(item) } if required_for.any?
      end
      payload
    end

    def find_description(feat)
      result = translate(feat[:description])
      result.gsub!(/{{[a-z]+}}/, '')
      result.gsub!('<<', '')
      result.gsub!('>>', '')
      markdown.call(value: result, version: '0.4.31')
    end

    def selected?(feat, slug)
      return true if @selected_feat_slugs[slug] # просто выбран

      selected_double_slugs.include?(feat.dig(:info, 'double_slug')) # выбран дубль
    end

    def selected_by_id?(feat, id)
      return true if @selected_feat_ids[id] # просто выбран

      selected_double_slugs.include?(feat.dig(:info, 'double_slug')) # выбран дубль
    end

    def selected_double_slugs
      @selected_double_slugs ||= @selected_feat_slugs.values.filter_map { |item| item['double_slug'] }.flatten
    end

    def feats
      @feats ||=
        Cosmere::Feat.where(user_id: nil).hashable_pluck(:id, :slug, :title, :description, :origin_value, :info)
          .index_by { |item| item[:slug] }
    end

    def feats_by_id
      @feats_by_id ||=
        Cosmere::Feat.where.not(user_id: nil).hashable_pluck(:id, :slug, :title, :description, :origin_value, :info)
          .index_by { |item| item[:id] }
    end

    def homebrews
      @homebrews ||= User::Homebrew.find_or_create_by(user: @character.user).data
    end
  end
end
