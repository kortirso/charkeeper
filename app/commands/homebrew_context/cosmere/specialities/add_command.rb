# frozen_string_literal: true

module HomebrewContext
  module Cosmere
    module Specialities
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_specialities

          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            required(:data).hash do
              required(:names).hash
              required(:descriptions).hash
            end
            optional(:public).filled(:bool)
          end
        end

        private

        def do_persist(input)
          result = ::Cosmere::Homebrew::Speciality.create!(input)

          { result: result }
        end
      end
    end
  end
end
