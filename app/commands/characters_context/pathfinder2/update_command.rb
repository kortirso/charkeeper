# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file'
      ]

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
          optional(:dying_condition_value).filled(:integer)
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
          optional(:name).filled(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

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

      # rubocop: disable Metrics/AbcSize
      def do_persist(input)
        input[:character].data =
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
