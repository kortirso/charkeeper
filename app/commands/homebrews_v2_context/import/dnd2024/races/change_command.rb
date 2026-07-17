# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Races
        class ChangeCommand < BaseCommand
          include Deps[
            cache: 'cache.dnd_names'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Dnd2024::Feat
                .where(origin: 'species', origin_value: input[:race].id)
                .group_by(&:id)
                .transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:race].update!(input.slice(:title, :description, :public, :info))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            cache.push_item(key: :races, item: input[:race])

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                # change_feat.call(
                #   feature.except(:id).merge({ feat: existing_feature, no_refresh: true, skip_contract_validation: true })
                # )
              else
                add_feat.call(
                  feature.merge({
                    user: input[:user],
                    origin: 'species',
                    origin_value: input[:race].id
                  })
                )
              end
            end
          end

          def remove_features(input)
            ::Dnd2024::Feat
              .where(origin: 'species', origin_value: input[:race].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end

          def add_feat = HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        end
      end
    end
  end
end
