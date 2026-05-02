# frozen_string_literal: true

module CharactersContext
  module Cosmere
    module Bonuses
      class AddCommand < BaseCommand
        NO_FORMULA_FIELDS = %i[str spd int wil awa pre].freeze
        ONLY_ADD_TYPE_FIELDS = %i[
          attack melee_attacks range_attacks damage melee_damage range_damage deflect
          'health_max' 'focus_max' 'investiture_max' 'defense.physical' 'defense.cognitive' 'defense.spiritual' movement
        ].freeze

        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Cosmere::Character, ::Cosmere::Item, ::Character::Item])
            required(:comment).filled(:string)
            optional(:value).hash do
              # values are integers, with add type
              optional(:str).hash
              optional(:spd).hash
              optional(:int).hash
              optional(:wil).hash
              optional(:awa).hash
              optional(:pre).hash
              # with add type
              optional(:attack).hash
              optional(:melee_attacks).hash
              optional(:range_attacks).hash
              optional(:damage).hash
              optional(:melee_damage).hash
              optional(:range_damage).hash
              optional(:health_max).hash
              optional(:focus_max).hash
              optional(:investiture_max).hash
              optional(:'defense.physical').hash
              optional(:'defense.cognitive').hash
              optional(:'defense.spiritual').hash
              optional(:deflect).hash
              optional(:movement).hash
            end
          end

          def variables
            @variables ||=
              {
                level: 1,
                tier: 1,
                str: 1,
                spd: 1,
                int: 1,
                wil: 1,
                awa: 1,
                pre: 1
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
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        def do_prepare(input)
          if input[:bonusable].is_a?(::Character::Item) || input[:bonusable].is_a?(::Cosmere::Item)
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
