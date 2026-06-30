# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Spells
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:spell).filled(type?: ::Dnd2024::Feat)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input)
            input[:attributes] = input[:spell].attributes.slice(
              'title', 'description', 'kind', 'public', 'origin', 'origin_values', 'info'
            ).symbolize_keys
            input[:attributes][:user] = input[:user]
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Dnd2024::Spells::AddCommand.new.call(input[:attributes])
          end
        end
      end
    end
  end
end
