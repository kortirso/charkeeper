# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Formulas
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:item).filled(type?: ::Pathfinder2::Item)
          end
        end

        private

        def do_persist(input)
          result = ::Character::Formula.create!(character: input[:character], item: input[:item])

          { result: result }
        rescue ActiveRecord::RecordNotUnique => _e
          { errors: { identity: ['Already exists'] }, errors_list: ['Already exists'] }
        end
      end
    end
  end
end
