# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module MechanicItems
        class ChangeCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            change_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.change'
          ]

          private

          def do_prepare(input)
            input[:existing_features] =
              ::Daggerheart::Feat
                .where(origin: 'mechanic', origin_value: input[:mechanic_item].id)
                .group_by(&:id)
                .transform_values(&:first)

            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:tier)
          end

          def do_persist(input)
            ActiveRecord::Base.transaction do
              input[:mechanic_item].update!(input.slice(:title, :description, :info))

              if input[:features]
                change_features(input)
                remove_features(input)
              end
            end

            { result: :ok }
          end

          def change_features(input)
            input[:features].each do |feature|
              if feature[:id]
                existing_feature = input[:existing_features][feature[:id]]
                next unless existing_feature

                change_feat.call(
                  feature.except(:id).merge({ feat: existing_feature, no_refresh: true, skip_contract_validation: true })
                )
              else
                add_feat.call(
                  feature.merge({
                    user: input[:user],
                    origin: 'mechanic',
                    origin_value: input[:mechanic_item].id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
            end
          end

          def remove_features(input)
            ::Daggerheart::Feat
              .where(origin: 'mechanic', origin_value: input[:mechanic_item].id)
              .where(id: input[:existing_features].keys - input[:features].pluck(:id)).destroy_all
          end
        end
      end
    end
  end
end
