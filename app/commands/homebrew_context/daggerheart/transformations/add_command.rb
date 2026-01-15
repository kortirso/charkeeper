# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    module Transformations
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_transformation

          params do
            required(:user).filled(type?: ::User)
            required(:name).filled(:string, max_size?: 50)
            optional(:public).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          input[:name_json] = { en: input[:name], ru: input[:name] }
        end

        def do_persist(input)
          result = ::Daggerheart::Homebrew::Transformation.create!(input)

          { result: result }
        end
      end
    end
  end
end
