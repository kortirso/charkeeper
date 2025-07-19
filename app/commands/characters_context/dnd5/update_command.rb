# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.dnd5.refresh_feats'
      ]

      SKILLS = %w[
        acrobatics animal arcana athletics deception history insight intimidation investigation
        medicine nature perception performance persuasion religion sleight stealth survival
      ].freeze
      WEAPON_CORE_SKILLS = %w[light martial].freeze
      ARMOR_PROFICIENCY = %w[light medium heavy shield].freeze
      LANGUAGES = %w[common dwarvish elvish giant gnomish goblin halfling orc draconic undercommon infernal druidic].freeze
      DAMAGE_TYPES = %w[
        bludge pierce slash acid cold fire force lighting necrotic
        poison psychic radiant thunder
      ].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dnd5_character

        params do
          required(:character).filled(type?: ::Dnd5::Character)
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
          optional(:death_saving_throws).hash do
            required(:success).filled(:integer)
            required(:failure).filled(:integer)
          end
          optional(:coins).hash do
            required(:gold).filled(:integer)
            required(:silver).filled(:integer)
            required(:copper).filled(:integer)
          end
          optional(:selected_skills).value(:array).each(included_in?: SKILLS)
          optional(:selected_feats).hash
          optional(:weapon_core_skills).value(:array).each(included_in?: WEAPON_CORE_SKILLS)
          optional(:weapon_skills).value(:array).each(
            included_in?: ::Dnd5::Item.where(kind: %w[light martial]).pluck(:slug).sort
          )
          optional(:armor_proficiency).value(:array).each(included_in?: ARMOR_PROFICIENCY)
          optional(:languages).value(:array).each(included_in?: LANGUAGES)
          optional(:spent_spell_slots).hash
          optional(:spent_hit_dice).hash
          optional(:tools).value(:array).each(:string)
          optional(:music).value(:array).each(:string)
          optional(:resistance).value(:array).each(included_in?: DAMAGE_TYPES)
          optional(:immunity).value(:array).each(included_in?: DAMAGE_TYPES)
          optional(:vulnerability).value(:array).each(included_in?: DAMAGE_TYPES)
          optional(:name).filled(:string)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        # ключи classes и subclasses должны быть одинаковые
        rule(:classes) do
          next if value.nil?

          # добавить проверку, что main_class присутствует в списке классов
          key.failure(:invalid_class_name) unless value.keys.all? { |item| item.in?(::Dnd5::Character::CLASSES) }
          key.failure(:invalid_level) unless value.values.all? { |item| item.to_i.between?(1, 20) }
        end

        # ключами должны быть class features, значениями - число использований
        # rule(:energy) do
        #   next if value.nil?

        #   key.failure(:invalid_class_name) unless value.keys.all? { |item| item.in?(::Dnd5::Character::CLASSES) }
        #   key.failure(:invalid_level) unless value.values.all? { |item| item.to_i.between?(1, 40) }
        # end

        rule(:subclasses) do
          next if value.nil?

          # добавить проверку, что подкласс еще не установлен
          key.failure(:invalid_class_name) unless value.keys.all? { |item| item.in?(::Dnd5::Character::CLASSES) }
          unless value.all? { |class_name, sub| sub.nil? || ::Dnd5::Character::SUBCLASSES[class_name].include?(sub) }
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

      # rubocop: disable Metrics/AbcSize
      def do_prepare(input)
        if input[:classes]
          input[:level] = input[:classes].values.sum(&:to_i)
          input[:added_classes] = input[:classes].keys - input[:character].data.classes.keys
          input[:removed_classes] = input[:character].data.classes.keys - input[:classes].keys
        end

        %i[classes abilities health coins energy spent_spell_slots spent_hit_dice].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
        return if input[:classes].blank?

        input[:hit_dice] = { 6 => 0, 8 => 0, 10 => 0, 12 => 0 }
        input[:classes].each do |key, class_level|
          input[:hit_dice][::Dnd5::Character::HIT_DICES[key]] += class_level
        end
      end

      def do_persist(input)
        input[:character].data =
          input[:character].data.attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        refresh_feats.call(character: input[:character]) if %i[classes subclasses selected_feats].intersect?(input.keys)
        refresh_spells(input) if input[:classes]

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]

        { result: input[:character] }
      end
      # rubocop: enable Metrics/AbcSize

      def refresh_spells(input)
        input[:added_classes].each do |added_class|
          spells =
            ::Dnd5::Spell
              .where('available_for && ?', "{#{added_class}}")
              .map do |spell|
                {
                  character_id: input[:character].id,
                  spell_id: spell.id,
                  data: { ready_to_use: false, prepared_by: added_class }
                }
              end
          ::Character::Spell.upsert_all(spells) if spells.any?
        end

        input[:removed_classes].each do |removed_class|
          input[:character].spells.where("data -> 'prepared_by' ? :prepared_by", prepared_by: removed_class).destroy_all
        end
      end
    end
  end
end
