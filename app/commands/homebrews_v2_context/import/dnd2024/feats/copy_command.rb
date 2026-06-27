# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Feats
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:feat).filled(type?: ::Dnd2024::Feat)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            input[:attributes] = input[:feat].attributes.slice(
              'title', 'description', 'kind', 'limit_refresh', 'public', 'origin', 'origin_value', 'info'
            ).symbolize_keys
            input[:attributes][:limit] = input[:feat].description_eval_variables['limit']
            input[:attributes][:level] = input[:feat].conditions['level']
            input[:attributes][:user] = input[:user]
            input[:attributes] = input[:attributes].compact
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new.call(input[:attributes])
          end
        end
      end
    end
  end
end
