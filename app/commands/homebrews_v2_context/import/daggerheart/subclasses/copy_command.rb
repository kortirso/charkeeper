# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Subclasses
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:subclass).filled(type?: ::Daggerheart::Homebrews::Subclass)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            input[:attributes] = input[:subclass].attributes.slice('title', 'description', 'public').symbolize_keys
            input[:attributes][:user] = input[:user]
            input[:attributes][:features] = features_payload(input)
            input[:attributes][:class_id] = input[:subclass].info.class_id
            input[:attributes][:spellcast] = input[:subclass].info.spellcast
            input[:attributes][:mechanics] = input[:subclass].info.mechanics
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Daggerheart::Subclasses::AddCommand.new.call(input[:attributes])
          end

          def features_payload(input)
            ::Daggerheart::Feat
              .where(origin: 'subclass', origin_value: input[:subclass].id)
              .map do |feat|
                result =
                  feat.attributes.slice('title', 'description', 'kind', 'limit_refresh', 'modifiers', 'price').symbolize_keys
                result[:limit] = feat.description_eval_variables['limit']
                result[:subclass_mastery] = feat.conditions['subclass_mastery']
                result.compact
              end
          end
        end
      end
    end
  end
end
