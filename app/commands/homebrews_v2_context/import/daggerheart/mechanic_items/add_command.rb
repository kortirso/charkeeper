# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module MechanicItems
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add'
          ]

          private

          def do_prepare(input)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:info] = input.slice(:tier)
          end

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              mechanic =
                ::Daggerheart::Homebrews::MechanicItem.create!(input.slice(:user, :homebrew_id, :title, :description, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'mechanic',
                    origin_value: mechanic.id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
              mechanic
            end

            { result: result }
          end
        end
      end
    end
  end
end
