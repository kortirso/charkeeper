# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class UpdateCommand < BaseCommand
      LANGUAGES = %w[
        common draconic dwarven elven gnomish goblin halfling jotun orcish sylvan undercommon
        aklo gnoll abyssal infernal celestial necril shadowtongue aquan auran terran ignan druidic
      ].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :pathfinder2_character

        params do
          required(:character).filled(type?: ::Pathfinder2::Character)
          optional(:classes).hash
          optional(:abilities).hash do
            required(:str).filled(:integer)
            required(:dex).filled(:integer)
            required(:con).filled(:integer)
            required(:int).filled(:integer)
            required(:wis).filled(:integer)
            required(:cha).filled(:integer)
          end
          optional(:health).hash do
            required(:current).filled(:integer)
            required(:max).filled(:integer)
            required(:temp).filled(:integer)
          end
          optional(:languages).value(:array).each(included_in?: LANGUAGES)
        end

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.positive? && item <= 30 }

          key.failure(:invalid_value)
        end

        rule(:health) do
          next if value.nil?
          next if value.values.all? { |item| !item.negative? }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:level] = input[:classes].values.sum(&:to_i) if input[:classes]
        %i[classes abilities health].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character).stringify_keys)
        input[:character].save!

        { result: input[:character].reload }
      end
    end
  end
end
