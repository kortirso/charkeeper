# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Items
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(:string)
            optional(:description).maybe(:string, max_size?: 250)
          end
        end

        private

        def do_prepare(input)
          input[:name] = { en: sanitize(input[:name]), ru: sanitize(input[:name]) }
          input[:description] = { en: sanitize(input[:description]), ru: sanitize(input[:description]) }
        end

        def do_persist(input)
          result = ::Dnd5::Item.create!(input)

          { result: result }
        end
      end
    end
  end
end
