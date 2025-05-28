# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class UpdateCommand < BaseCommand
      SKILLS = %w[
        acrobatics arcana athletics crafting deception diplomacy intimidation medicine nature
        occultism performance religion society stealth survival thievery
      ].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :pathfinder2_character

        params do
          required(:character).filled(type?: ::Pathfinder2::Character)
          optional(:classes).hash
          # TODO: проверить кол-во переданных навыков
          # TODO: вычесть из ability_boosts
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
          optional(:languages).value(:array).each(:string)
          optional(:saving_throws).hash do
            required(:fortitude).filled(:integer)
            required(:reflex).filled(:integer)
            required(:will).filled(:integer)
          end
          # TODO: проверить кол-во переданных навыков
          # TODO: вычесть из skill_boosts
          optional(:selected_skills).hash
          optional(:lore_skills).hash do
            required(:lore1).hash do
              optional(:name).maybe(:string)
              optional(:level).filled(:integer)
            end
            required(:lore2).hash do
              optional(:name).maybe(:string)
              optional(:level).filled(:integer)
            end
          end
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

        rule(:selected_skills) do
          next if value.nil?
          next if (value.keys - SKILLS).empty?

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:level] = input[:classes].values.sum(&:to_i) if input[:classes]
        %i[classes abilities health saving_throws selected_skills].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character).stringify_keys)
        input[:character].save!

        { result: input[:character] }
      end
    end
  end
end
