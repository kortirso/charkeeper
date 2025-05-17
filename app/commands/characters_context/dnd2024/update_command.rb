# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class UpdateCommand < BaseCommand
      SKILLS = %w[
        acrobatics animal arcana athletics deception history insight intimidation investigation
        medicine nature perception performance persuasion religion sleight stealth survival
      ].freeze
      WEAPON_CORE_SKILLS = ['light weapon', 'martial weapon'].freeze
      ARMOR_PROFICIENCY = ['light armor', 'medium armor', 'heavy armor', 'shield'].freeze
      LANGUAGES = %w[common dwarvish elvish giant gnomish goblin halfling orc draconic undercommon infernal druidic].freeze
      DAMAGE_TYPES = %w[
        bludge pierce slash acid cold fire force lighting necrotic
        poison psychic radiant thunder
      ].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd2024::Character)
          optional(:classes).hash
          optional(:subclasses).hash
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
          optional(:coins).hash do
            required(:gold).filled(:integer)
            required(:silver).filled(:integer)
            required(:copper).filled(:integer)
          end
          optional(:selected_skills).value(:array).each(included_in?: SKILLS)
          optional(:selected_features).hash
          optional(:weapon_core_skills).value(:array).each(included_in?: WEAPON_CORE_SKILLS)
          # optional(:weapon_skills).value(:array).each(
          #   included_in?: ::Dnd2024::Item.where(kind: ['light weapon', 'martial weapon']).pluck(:slug).sort
          # )
          optional(:armor_proficiency).value(:array).each(included_in?: ARMOR_PROFICIENCY)
          optional(:languages).value(:array).each(included_in?: LANGUAGES)
          optional(:energy).hash
          optional(:spent_spell_slots).hash
          optional(:spent_hit_dice).hash
          optional(:tools).value(:array).each(:string)
          optional(:music).value(:array).each(:string)
          optional(:resistance).value(:array).each(included_in?: DAMAGE_TYPES)
          optional(:immunity).value(:array).each(included_in?: DAMAGE_TYPES)
          optional(:vulnerability).value(:array).each(included_in?: DAMAGE_TYPES)
        end

        # ключи classes и subclasses должны быть одинаковые
        rule(:classes) do
          next if value.nil?

          # добавить проверку, что main_class присутствует в списке классов
          key.failure(:invalid_class_name) unless value.keys.all? { |item| item.in?(::Dnd2024::Character::CLASSES) }
          key.failure(:invalid_level) unless value.values.all? { |item| item.to_i.between?(1, 20) }
        end

        rule(:subclasses) do
          next if value.nil?

          # добавить проверку, что подкласс еще не установлен
          key.failure(:invalid_class_name) unless value.keys.all? { |item| item.in?(::Dnd2024::Character::CLASSES) }
          unless value.all? { |class_name, sub| sub.nil? || ::Dnd2024::Character::SUBCLASSES[class_name].include?(sub) }
            key.failure(:invalid_subclass)
          end
        end

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.positive? && item <= 30 }

          key.failure(:invalid_value)
        end

        rule(:coins) do
          next if value.nil?
          next if value.values.all? { |item| !item.negative? }

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
        %i[classes abilities health coins energy spent_spell_slots spent_hit_dice].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
        return if input[:classes].blank?

        input[:hit_dice] = { 6 => 0, 8 => 0, 10 => 0, 12 => 0 }
        input[:classes].each do |key, class_level|
          input[:hit_dice][::Dnd2024::Character::HIT_DICES[key]] += class_level
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
