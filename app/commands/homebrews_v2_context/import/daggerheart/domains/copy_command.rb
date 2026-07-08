# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Domains
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:domain).filled(type?: ::Daggerheart::Homebrews::Domain)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input)
            input[:attributes] = input[:domain].attributes.slice('title', 'description', 'public').symbolize_keys
            input[:attributes][:user] = input[:user]
            input[:attributes][:features] = features_payload(input)
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Daggerheart::Domains::AddCommand.new.call(input[:attributes])
          end

          def features_payload(input) # rubocop: disable Metrics/AbcSize
            ::Daggerheart::Feat
              .where(origin: 'domain_card', origin_value: input[:domain].id)
              .map do |feat|
                result =
                  feat.attributes.slice(
                    'title', 'description', 'kind', 'limit_refresh', 'modifiers', 'price', 'continious', 'tokens'
                  ).symbolize_keys
                result[:limit] = feat.description_eval_variables['limit']
                result[:level] = feat.conditions['level']
                result[:type] = feat.info['type']
                result[:recall] = feat.info['recall']
                result.compact
              end
          end
        end
      end
    end
  end
end
