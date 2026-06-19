# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Specialities
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:speciality).filled(type?: ::Daggerheart::Homebrews::Speciality)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input)
            input[:attributes] = input[:speciality].attributes.slice('title', 'description', 'public', 'info').symbolize_keys
            input[:attributes][:user] = input[:user]
            input[:attributes][:features] = features_payload(input)
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Daggerheart::Specialities::AddCommand.new.call(input[:attributes])
          end

          def features_payload(input)
            ::Daggerheart::Feat
              .where(origin: 'speciality', origin_value: input[:speciality].id)
              .map do |feat|
                result = feat.attributes.slice('title', 'description', 'kind', 'limit_refresh').symbolize_keys
                result[:limit] = feat.description_eval_variables['limit']
                result.compact
              end
          end
        end
      end
    end
  end
end
