# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Specialities
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            cache: 'cache.daggerheart_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              speciality = ::Daggerheart::Homebrews::Speciality.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'class',
                    origin_value: speciality.id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
              speciality
            end

            cache.push_item(key: :classes, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
