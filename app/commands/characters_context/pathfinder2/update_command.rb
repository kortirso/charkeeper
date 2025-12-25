# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        cache: 'cache.avatars'
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
          optional(:languages).filled(:string)
          optional(:saving_throws).hash do
            required(:fortitude).filled(:integer)
            required(:reflex).filled(:integer)
            required(:will).filled(:integer)
          end
          optional(:selected_skills).hash
          optional(:lore_skills).hash do
            required(:lore1).hash do
              required(:name).maybe(:string)
              required(:level).filled(:integer)
            end
            required(:lore2).hash do
              required(:name).maybe(:string)
              required(:level).filled(:integer)
            end
          end
          optional(:name).filled(:string, max_size?: 50)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
          optional(:file)
          optional(:weapon_skills).hash
          optional(:armor_skills).hash
          optional(:coins).hash do
            required(:gold).filled(:integer)
            required(:silver).filled(:integer)
            required(:copper).filled(:integer)
          end
          optional(:money).filled(:integer, gteq?: 0)
          optional(:conditions).maybe(:array).each(:string)
        end

        rule(:avatar_file, :avatar_url, :file).validate(:check_only_one_present)

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

        rule(:coins) do
          next if value.nil?
          next if value.values.all? { |item| !item.negative? }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
      def do_prepare(input)
        input[:level] = input[:classes].values.sum(&:to_i) if input[:classes]
        %i[classes abilities health saving_throws selected_skills coins].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:abilities)
          input[:ability_boosts_v2] = nil
          input[:ability_boosts] = nil

          if input[:character].data.skill_boosts.present?
            input[:skill_boosts] = input[:character].data.skill_boosts
            input[:skill_boosts]['free'] += (input.dig(:abilities, :int) / 2) - 5
          end
        end
        input[:skill_boosts] = nil if input.key?(:selected_skills)

        if input.key?(:money)
          gold, modulus = input[:money].divmod(100)
          silver, copper = modulus.divmod(10)
          input[:coins] = { copper: copper, silver: silver, gold: gold }
        elsif input.key?(:coins)
          input[:money] = (input.dig(:coins, :gold) * 100) + (input.dig(:coins, :silver) * 10) + input.dig(:coins, :copper)
        end
      end

      def do_persist(input)
        input[:character].data =
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end
      # rubocop: enable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity

      def upload_avatar(input)
        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]
        input[:character].avatar.attach(input[:file]) if input[:file]

        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
