# frozen_string_literal: true

module CharactersContext
  module Cthulhu7
    module Items
      class CreateCommand < BaseCommand
        include Deps[
          character_item_add: 'commands.characters_context.items.add'
        ]

        use_contract do
          params do
            required(:character).filled(type?: ::Cthulhu7::Character)
            required(:name).filled(:string, max_size?: 50)
            required(:kind).filled(:string)
            optional(:info).hash do
              required(:skill).filled(:string)
              required(:damage).filled(:string, max_size?: 20)
              required(:with_damage_bonus).filled(:bool)
              required(:distance).filled(:string, max_size?: 10)
              required(:attacks).filled(:integer, gteq?: 1, lteq?: 20)
            end
          end
        end

        private

        def do_prepare(input)
          input[:user] = input[:character].user
          input[:name] = { en: sanitize(input[:name]) }
        end

        def do_persist(input)
          ActiveRecord::Base.transaction do
            item = ::Cthulhu7::Item.create!(input.except(:character))
            character_item_add.call({ character: input[:character], item: item })
          end
        end
      end
    end
  end
end
