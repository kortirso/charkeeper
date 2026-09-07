# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module InvestedArts
        class ChangeCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.cosmere.feats.add',
            change_feat: 'commands.homebrews_v2_context.import.cosmere.feats.change',
            cache: 'cache.cosmere_names'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Cosmere::Feat
                .where(origin: 'surge', origin_value: input[:invested_art].id)
                .group_by(&:id)
                .transform_values(&:first)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:invested_art].update!(input.slice(:title, :description, :public, :info))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            cache.push_item(key: :invested_arts, item: input[:invested_art])

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                change_feat.call(
                  feature.except(:id).merge({ feat: existing_feature, origin_value: input[:invested_art].id })
                )
              else
                add_feat.call(
                  feature.merge({ origin_value: input[:invested_art].id })
                )
              end
            end
          end

          def remove_features(input)
            ::Cosmere::Feat
              .where(origin: 'surge', origin_value: input[:invested_art].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
