# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Bonuses
      class AddCommand < BaseCommand
        # rubocop: disable Metrics/BlockLength
        use_contract do
          params do
            required(:bonusable).filled(type_included_in?: [::Daggerheart::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:str).hash
              optional(:agi).hash
              optional(:fin).hash
              optional(:ins).hash
              optional(:pre).hash
              optional(:know).hash
              optional(:'damage_thresholds.major').hash
              optional(:'damage_thresholds.severe').hash
              optional(:health_max).hash
              optional(:stress_max).hash
              optional(:hope_max).hash
              optional(:evasion).hash
              optional(:armor_score).hash
              optional(:attack).hash
              optional(:proficiency).hash
              optional(:damage).hash
              optional(:spell_bonus).hash
              optional(:loadout).hash
            end
          end

          def variables
            @variables ||=
              {
                proficiency: 1,
                tier: 1,
                level: 1,
                no_armor: true,
                str: 3,
                agi: 2,
                fin: 1,
                ins: 0,
                pre: 3,
                know: 1,
                spellcast: 0
              }
          end

          def formula = Charkeeper::Container.resolve('formula')

          rule(:value) do
            next if value.blank?

            value.keys.each do |key|
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value), variables: variables).nil?
              key(:ability).failure(:only_add) unless value.dig(key, :type) == 'add'
            end
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        def do_persist(input)
          result = ::Character::Bonus.create!(input)

          { result: result }
        end
      end
    end
  end
end
