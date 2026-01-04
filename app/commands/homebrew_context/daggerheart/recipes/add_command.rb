# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    module Recipes
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :item

          params do
            required(:user).filled(type?: ::User)
            required(:tool_id).filled(:string, :uuid_v4?)
            required(:item_id).filled(:string, :uuid_v4?)
            optional(:public).filled(:bool)
          end
        end

        private

        def do_prepare(input)
          input[:tool] = ::Daggerheart::Item.where(kind: 'recipe').find(input[:tool_id])
          input[:item] = ::Daggerheart::Item.find(input[:item_id])
        end

        def do_persist(input)
          result = ::Item::Recipe.create!(input.slice(:user, :tool, :item, :public))

          { result: result }
        end
      end
    end
  end
end
