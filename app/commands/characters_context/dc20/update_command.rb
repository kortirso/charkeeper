# frozen_string_literal: true

module CharactersContext
  module Dc20
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.dc20.refresh_feats',
        cache: 'cache.avatars'
      ]

      LEVELING = {
        2 => { 'talent_points' => 1, 'path_points' => 1 },
        3 => { 'attribute_points' => 1, 'skill_points' => 1, 'trade_points' => 1 },
        4 => { 'ancestry_points' => 2, 'talent_points' => 1, 'path_points' => 1 },
        5 => { 'attribute_points' => 1, 'skill_points' => 2, 'trade_points' => 1 },
        6 => { 'skill_points' => 1, 'path_points' => 1 },
        7 => { 'ancestry_points' => 2, 'talent_points' => 1 },
        8 => { 'attribute_points' => 1, 'skill_points' => 1, 'trade_points' => 1, 'path_points' => 1 },
        9 => {},
        10 => { 'attribute_points' => 1, 'skill_points' => 2, 'trade_points' => 1, 'talent_points' => 1 }
      }.freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dc20_character

        params do
          required(:character).filled(type?: ::Dc20::Character)
          optional(:subclass).filled(:string)
          optional(:level).filled(:integer)
          optional(:abilities).hash do
            required(:mig).filled(:integer)
            required(:agi).filled(:integer)
            required(:int).filled(:integer)
            required(:cha).filled(:integer)
          end
          optional(:health).hash do
            required(:current).filled(:integer)
            required(:temp).filled(:integer)
          end
          optional(:combat_expertise).value(:array).each(included_in?: ::Dc20::Character.combat_expertise.keys)
          optional(:name).filled(:string, max_size?: 50)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
          optional(:file)
          optional(:guide_step).maybe(:integer)
          optional(:skill_levels).hash
          optional(:skill_expertise).value(:array)
          optional(:trade_levels).hash
          optional(:trade_expertise).value(:array)
          optional(:trade_knowledge).hash
          optional(:language_levels).hash
          optional(:skill_points).filled(:integer)
          optional(:trade_points).filled(:integer)
          optional(:language_points).filled(:integer)
          optional(:conditions).maybe(:array).each(:string)
          optional(:paths).hash
          optional(:path_points).filled(:integer)
          optional(:stamina_points).hash do
            required(:current).filled(:integer)
          end
          optional(:mana_points).hash do
            required(:current).filled(:integer)
          end
          optional(:grit_points).hash do
            required(:current).filled(:integer)
          end
          optional(:rest_points).hash do
            required(:current).filled(:integer)
          end
          optional(:maneuvers).value(:array)
          optional(:selected_features).hash
        end

        rule(:avatar_file, :avatar_url, :file).validate(:check_only_one_present)

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(-2, 7) }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
        data = input[:character].data

        if input.key?(:abilities)
          input[:attribute_points] = 0
          if data.guide_step == 1
            input[:skill_points] = 5 + input[:abilities][:int]
            input[:trade_points] = 3
            input[:language_points] = 2
          end
        end

        if input.key?(:skill_levels)
          expertise_change = input[:skill_expertise].count - data.skill_expertise.count
          levels_change = input[:skill_levels].values.sum - data.skill_levels.values.sum

          spent_expertise_points = [data.skill_expertise_points, expertise_change].min
          spent_points = [data.skill_points, levels_change].min
          spent_additonal_points =
            expertise_change > data.skill_expertise_points ? (expertise_change - data.skill_expertise_points) : 0

          input[:skill_points] = data.skill_points - spent_points - spent_additonal_points
          input[:skill_expertise_points] = data.skill_expertise_points - spent_expertise_points
        end

        if input.key?(:trade_levels)
          expertise_change = input[:trade_expertise].count - data.trade_expertise.count
          levels_change = input[:trade_levels].values.sum - data.trade_levels.values.sum

          spent_expertise_points = [data.trade_expertise_points, expertise_change].min
          spent_points = [data.trade_points, levels_change].min
          spent_additonal_points =
            expertise_change > data.trade_expertise_points ? (expertise_change - data.trade_expertise_points) : 0

          input[:trade_points] = data.trade_points - spent_points - spent_additonal_points
          input[:trade_expertise_points] = data.trade_expertise_points - spent_expertise_points
        end

        if input.key?(:language_levels) # rubocop: disable Style/GuardClause
          input[:language_points] =
            [data.language_points - (input[:language_levels].values.sum - data.language_levels.values.sum), 0].max
        end
      end

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        input[:character].data =
          input[:character].data.attributes.merge(
            input.except(:character, :avatar_file, :avatar_url, :file, :name).stringify_keys
          )
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        refresh_points(input[:character]) if input.key?(:level)
        refresh_maneuver_feats(input[:character]) if input.key?(:maneuvers)
        refresh_feats.call(character: input[:character]) if %i[level subclass selected_features].intersect?(input.keys)
        upload_avatar(input)

        { result: input[:character] }
      end

      def refresh_points(character)
        character.data =
          character.data.attributes.merge(LEVELING[character.data.level]) { |_key, oldval, newval| newval + oldval }
        character.save
      end

      def refresh_maneuver_feats(character)
        character.feats.joins(:feat).where(feats: { origin: 3 }).delete_all
        feats_for_adding = ::Dc20::Feat.where(origin: 3, slug: character.data.maneuvers).map do |feat|
          {
            feat_id: feat.id,
            character_id: character.id,
            ready_to_use: true
          }
        end
        ::Character::Feat.upsert_all(feats_for_adding) if feats_for_adding.any?
      end

      def upload_avatar(input) # rubocop: disable Metrics/AbcSize
        return if input.slice(:avatar_file, :avatar_url, :file).keys.blank?

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]
        input[:character].avatar.attach(input[:file]) if input[:file]

        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
