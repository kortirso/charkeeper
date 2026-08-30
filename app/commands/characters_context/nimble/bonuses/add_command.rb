# frozen_string_literal: true

module CharactersContext
  module Nimble
    module Bonuses
      class AddCommand < BaseCommand
        ONLY_ADD_TYPE_FIELDS = %i[
          str dex int wil 'health.max' initiative
        ].freeze

        # rubocop: disable-next Metrics/BlockLength
        use_contract do
          params do
            required(:bonusable).filled(type_included_in?: [::Nimble::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:str).hash
              optional(:dex).hash
              optional(:int).hash
              optional(:wil).hash
              optional(:initiative).hash
              optional(:'health.max').hash
            end
          end

          def variables
            @variables ||=
              {
                level: 1,
                no_armor: true,
                str: 3,
                dex: 2,
                int: 1,
                wil: 0
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

        private

        def do_persist(input)
          result = ::Character::Bonus.create!(input)

          { result: result }
        end
      end
    end
  end
end
