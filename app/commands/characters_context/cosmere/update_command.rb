# frozen_string_literal: true

module CharactersContext
  module Cosmere
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      CHANGE_HEALTH_BY_STR_AT_LEVEL = [1, 6].freeze
      CHANGE_ATTRIBUTE_POINTS_AT_LEVEL = [3, 6, 9, 12, 15, 18].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :cosmere_character

        params do
          required(:character).filled(type?: ::Cosmere::Character)
          optional(:level).filled(:integer)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: 0)
            required(:spd).filled(:integer, gteq?: 0)
            required(:int).filled(:integer, gteq?: 0)
            required(:wil).filled(:integer, gteq?: 0)
            required(:awa).filled(:integer, gteq?: 0)
            required(:pre).filled(:integer, gteq?: 0)
          end
          optional(:selected_skills).hash
          optional(:additional_skills).hash
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
          optional(:guide_step).maybe(:integer)
          optional(:attribute_points).filled(:integer, gteq?: 0)
          optional(:skill_points).filled(:integer, gteq?: 0)
          optional(:health).filled(:integer, gteq?: 0)
          optional(:focus).filled(:integer, gteq?: 0)
          optional(:investiture).filled(:integer, gteq?: 0)
          optional(:expertises).hash do
            required(:weapon).maybe(:array)
            required(:armor).maybe(:array)
            required(:culture).maybe(:array)
          end
          optional(:custom_expertises).maybe(:array).each(:hash) do
            required(:name).filled(:string, max_size?: 50)
            required(:desc).filled(:string, max_size?: 500)
          end
          optional(:purpose).filled(:string, max_size?: 200)
          optional(:obstacle).filled(:string, max_size?: 200)
          optional(:goals).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:text).filled(:string, max_size?: 100)
            required(:counter).filled(:integer, gteq?: 0)
          end
          optional(:connections).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:text).filled(:string, max_size?: 100)
          end
        end

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(0, 20) }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        %i[abilities].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:level)
          if CHANGE_ATTRIBUTE_POINTS_AT_LEVEL.include?(input[:level])
            input[:attribute_points] = input[:character].data.attribute_points.to_i + 1
          end
          input[:skill_points] = input[:character].data.skill_points.to_i + 2
        end

        current_health = input[:character].data.health_max
        input[:health_max] = current_health + change_health_by_level(input) if input.key?(:level)
        input[:health_max] = current_health + change_health_by_str(input) if input.key?(:abilities)
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end

      def change_health_by_level(input)
        current_str = input[:character].data.abilities['str']

        return 1 if input[:level] >= 21
        return 2 if input[:level] >= 17
        return 2 + current_str if input[:level] == 16
        return 3 if input[:level] >= 12
        return 3 + current_str if input[:level] == 11
        return 4 if input[:level] >= 7
        return 4 + current_str if input[:level] == 6

        5
      end

      def change_health_by_str(input)
        current_level = input[:character].data.level
        return 0 if CHANGE_HEALTH_BY_STR_AT_LEVEL.exclude?(current_level)

        input.dig(:abilities, :str) - input[:character].data.abilities['str']
      end

      def upload_avatar(input)
        return unless input.key?(:file)

        input[:character].avatar.attach(input[:file])
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
