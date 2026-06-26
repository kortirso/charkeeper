# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Items
          class CopyCommand < BaseCommand
            use_contract do
              params do
                required(:item).filled(type?: ::Daggerheart::Item)
                required(:user).filled(type?: ::User)
              end
            end

            private

            def do_prepare(input)
              input[:attributes] = input[:item].attributes.slice('name', 'description', 'public', 'kind', 'info').symbolize_keys
              if input[:item].kind == 'recipe'
                input[:attributes][:item_names] = input[:item].recipes.map { |recipe| recipe.item.name['en'] }
              end
              input[:attributes][:user] = input[:user]
            end

            def do_persist(input)
              HomebrewsV2Context::Import::Daggerheart::Items::Items::AddCommand.new.call(input[:attributes])
            end
          end
        end
      end
    end
  end
end
