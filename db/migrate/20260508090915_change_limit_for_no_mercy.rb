class ChangeLimitForNoMercy < ActiveRecord::Migration[8.1]
  def change
    feat = Daggerheart::Feat.find_by(slug: 'no_mercy')
    return unless feat

    feat.update(description_eval_variables: { limit: '0' })
  end
end
