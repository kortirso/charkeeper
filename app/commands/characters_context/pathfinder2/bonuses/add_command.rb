# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Bonuses
      class AddCommand < BaseCommand
        NO_FORMULA_FIELDS = %i[str dex con wis int cha].freeze
        ONLY_ADD_TYPE_FIELDS = %i[
          attack unarmed_attacks melee_attacks range_attacks damage unarmed_damage melee_damage range_damage 'health.max'
        ].freeze
        ANY_VALUE_FIELDS = %i[
          'saving_throws_value.fortitude' 'saving_throws_value.reflex' 'saving_throws_value.will' perception armor_class speed
          'speeds.swim' 'speeds.fly' 'speeds.climb' 'speeds.burrow'
        ].freeze

        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Pathfinder2::Character, ::Pathfinder2::Item, ::Character::Item])
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
              optional(:'health.max').hash
              # with add/set type
              optional(:'saving_throws_value.fortitude').hash
              optional(:'saving_throws_value.reflex').hash
              optional(:'saving_throws_value.will').hash
              optional(:perception).hash
              optional(:armor_class).hash
              optional(:speed).hash
              optional(:'speeds.swim').hash
              optional(:'speeds.fly').hash
              optional(:'speeds.climb').hash
              optional(:'speeds.burrow').hash
              # with concat type
              optional(:resistance).hash
              optional(:immunity).hash
              optional(:vulnerability).hash
            end
          end

          def variables
            @variables ||=
              {
                level: 1,
                no_body_armor: true,
                no_armor: false,
                str: 1,
                dex: 1,
                con: 1,
                wis: 1,
                int: 1,
                cha: 1
              }
          end

          def formula = Charkeeper::Container.resolve('formula')

          rule(:value) do
            next if value.blank?

            NO_FORMULA_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:only_add) unless value.dig(key, :type) == 'add'
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value)).nil?
            end

            ONLY_ADD_TYPE_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:only_add) unless value.dig(key, :type) == 'add'
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value), variables: variables).nil?
            end

            ANY_VALUE_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value), variables: variables).nil?
            end
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        def do_prepare(input)
          if input[:bonusable].is_a?(::Character::Item) || input[:bonusable].is_a?(::Pathfinder2::Item)
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
