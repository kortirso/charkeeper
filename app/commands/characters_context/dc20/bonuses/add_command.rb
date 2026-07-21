# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Bonuses
      class AddCommand < BaseCommand
        ONLY_ADD_TYPE_FIELDS = %i[
          mig agi int cha 'attribute_saves.mig' 'attribute_saves.agi' 'attribute_saves.int' 'attribute_saves.cha' pd_base ad_base
          initiative attack damage max_stamina_points max_mana_points maneuver_points max_health
        ].freeze

        # rubocop: disable Metrics/BlockLength
        use_contract do
          params do
            required(:bonusable).filled(type_included_in?: [::Dc20::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:mig).hash
              optional(:agi).hash
              optional(:int).hash
              optional(:cha).hash
              optional(:'attribute_saves.mig').hash
              optional(:'attribute_saves.agi').hash
              optional(:'attribute_saves.int').hash
              optional(:'attribute_saves.cha').hash
              optional(:pd_base).hash
              optional(:ad_base).hash
              optional(:initiative).hash
              optional(:attack).hash
              optional(:damage).hash
              optional(:max_stamina_points).hash
              optional(:max_mana_points).hash
              optional(:maneuver_points).hash
              optional(:max_health).hash
              optional(:spells).hash
              optional(:'speeds.ground').hash
              optional(:'speeds.swim').hash
              optional(:'speeds.climb').hash
              optional(:'speeds.flight').hash
              optional(:'speeds.glide').hash
            end
          end

          def variables
            @variables ||=
              {
                combat_mastery: 1,
                level: 1,
                no_armor: true,
                mig: 3,
                agi: 2,
                int: 1,
                cha: 0,
                prime: 3
              }
          end

          def formula = Charkeeper::Container.resolve('formula')

          rule(:value) do
            next if value.blank?

            value.keys.each do |key|
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value), variables: variables).nil?
            end

            ONLY_ADD_TYPE_FIELDS.each do |key|
              next if value[key].blank?

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
