# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Bonuses
      class AddV3Command < BaseCommand
        NO_FORMULA_FIELDS = %i[str dex con wis int cha].freeze
        ONLY_ADD_TYPE_FIELDS = %i[
          attack unarmed_attacks melee_attacks range_attacks damage unarmed_damage melee_damage range_damage
        ].freeze
        ANY_VALUE_FIELDS = %i[
          'save_dc.str' 'save_dc.dex' 'save_dc.con' 'save_dc.wis' 'save_dc.int' 'save_dc.cha' initiative
          armor_class speed 'speeds.swim' 'speeds.flight' 'speeds.climb' attacks_per_action load
        ].freeze

        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Dnd2024::Character, ::Dnd2024::Item, ::Character::Item])
            required(:comment).filled(:string)
            optional(:value).hash do
              # values are integers, with add type
              optional(:str).hash
              optional(:dex).hash
              optional(:con).hash
              optional(:wis).hash
              optional(:int).hash
              optional(:cha).hash
              # with add type
              optional(:attack).hash
              optional(:unarmed_attacks).hash
              optional(:melee_attacks).hash
              optional(:range_attacks).hash
              optional(:damage).hash
              optional(:unarmed_damage).hash
              optional(:melee_damage).hash
              optional(:range_damage).hash
              # with add/set type
              optional(:'save_dc.str').hash
              optional(:'save_dc.dex').hash
              optional(:'save_dc.con').hash
              optional(:'save_dc.wis').hash
              optional(:'save_dc.int').hash
              optional(:'save_dc.cha').hash
              optional(:initiative).hash
              optional(:armor_class).hash
              optional(:speed).hash
              optional(:'speeds.swim').hash
              optional(:'speeds.flight').hash
              optional(:'speeds.climb').hash
              optional(:attacks_per_action).hash
              optional(:load).hash
              # with concat type
              optional(:resistance).hash
              optional(:immunity).hash
              optional(:vulnerability).hash
            end
          end

          def variables
            @variables ||=
              {
                proficiency_bonus: 1,
                level: 1,
                no_body_armor: true,
                no_armor: false,
                str: 10,
                dex: 10,
                con: 10,
                wis: 10,
                int: 10,
                cha: 10
              }.merge(Dnd2024Decorator::DEFAULT_CLASSES.index_with(0).transform_keys { |key| "#{key}_level" }.symbolize_keys)
          end

          def formula = Charkeeper::Container.resolve('formula')

          rule(:value) do
            next if value.blank?

            NO_FORMULA_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:only_add) unless value.dig(key, 'type') == 'add'
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, 'value')).nil?
            end

            ONLY_ADD_TYPE_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:only_add) unless value.dig(key, 'type') == 'add'
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, 'value'), variables: variables).nil?
            end

            ANY_VALUE_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, 'value'), variables: variables).nil?
            end
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        def do_prepare(input)
          if input[:bonusable].is_a?(::Character::Item) || input[:bonusable].is_a?(::Dnd2024::Item)
            input[:modifiers] = input[:value]
          end
        end

        def do_persist(input)
          result =
            if input.key?(:modifiers)
              input[:bonusable].update(modifiers: input[:modifiers])
              input[:bonusable]
            else
              ::Character::Bonus.create!(input)
            end

          { result: result }
        end
      end
    end
  end
end
