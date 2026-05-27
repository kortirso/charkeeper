# frozen_string_literal: true

module HomebrewContext
  module Cosmere
    module Specialities
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_specialities

          params do
            required(:speciality).filled(type?: ::Cosmere::Homebrew::Speciality)
            required(:data).hash do
              required(:names).hash
              required(:descriptions).hash
            end
            optional(:public).filled(:bool)
          end
        end

        private

        def do_persist(input)
          input[:speciality].create!(input.except(:speciality))

          { result: input[:speciality] }
        end
      end
    end
  end
end
