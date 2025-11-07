# frozen_string_literal: true

module CharactersContext
  module Dc20
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dc20_character

        params do
          required(:character).filled(type?: ::Dc20::Character)
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
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(-2, 7) }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

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
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        if input.key?(:level)
          Dc20Character::ClassUpdater.new.call(character: input[:character])
        end

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
    end
  end
end
